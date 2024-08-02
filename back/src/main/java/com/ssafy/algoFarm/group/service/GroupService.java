package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.dto.response.*;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.group.repository.MemberRepository;
import com.ssafy.algoFarm.mascot.entity.Mascot;
import com.ssafy.algoFarm.mascot.repository.MascotRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class GroupService {
    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final MascotRepository mascotRepository;

    /**
     * 그룹을 생성한뒤 그룹 id를 반환한다.
     *
     * @param userPk user고유id
     * @param nickname 그룹에 참가하며 사용할 nickname
     * @param groupName 생성할 그룹의 이름
     * @return dto
     */
    public CreateGroupResDto createGroup(Long userPk, String nickname, String groupName) {
        //기본 캐릭터 조회
        Mascot defaultMascot = mascotRepository.findById(1L).orElseThrow(()-> new BusinessException(ErrorCode.MASCOT_NOT_FOUND));

        Group newGroup = new Group();
        //그룹을 생성한다.
        //TODO 초대코드 로직 레디스 활용해서 바꿔야함.
        String inviteCode = UUID.randomUUID().toString();
        newGroup.setCode(inviteCode);
        newGroup.setName(groupName);
        newGroup.setMascot(defaultMascot);
        groupRepository.save(newGroup);
        Long groupId = newGroup.getId();



        //해당 그룹에 생성자를 가입시킨다.
        User participant = userRepository.findById(userPk).get();
        Member member = new Member();
        member.setUser(participant);
        member.setNickname(nickname);
        member.setIsLeader(true); //그룹장 표기
        member.setGroup(newGroup);
        memberRepository.save(member);


        newGroup.setCurrentNum(newGroup.getCurrentNum() + 1);

        return new CreateGroupResDto(groupId,groupName,inviteCode);
    }

    /**
     * 초대코드를 통해 그룹에 가입하는 로직
     * @param code 초대코드
     * @return JoinGroupResDto(그룹id, 그룹명)
     */
    public JoinGroupResDto joinGroup( Long userPk, String nickname, String code) {

        Group group = groupRepository.findByCode(code).orElseThrow();

        User participant = userRepository.findById(userPk).get();
        Member newMember = new Member();
        newMember.setUser(participant);
        newMember.setNickname(nickname);
        newMember.setGroup(group);
        memberRepository.save(newMember);
        group.setCurrentNum(group.getCurrentNum() + 1);

        return new JoinGroupResDto(group.getId(), group.getName());
    }

    /**
     * 그룹탈퇴를 위한 메서드
     * @param userPk user고유 pk
     * @param groupId 탈퇴할 그룹id
     */
    public void leaveGroup(Long userPk, Long groupId) {
        //그룹의 마지막 멤버인 경우, 그룹을 삭제한다.
        //TODO 그룹이 없는 경우 예외처리 해야함.
        Group group = groupRepository.findById(groupId).orElseThrow();
        if(group.getMembers().size() == 1){
            groupRepository.delete(group);
            return;
        }

        //그룹장의 경우 가입일이 빠른 다른 파티원에게 그룹장의 권한을 넘긴다.
        log.info("userPk={}",userPk);
        Member member = memberRepository.findByUserIdAndGroupId(userPk,groupId).orElseThrow();
        if(member.getIsLeader()){
            List<Member> members = group.getMembers();
            members.sort((m1, m2) -> m1.getJoinAt().compareTo(m2.getJoinAt()));

            for(int i = 0;  i < group.getMembers().size(); i++){
                if(!members.get(i).equals(member)){
                    members.get(i).setIsLeader(true);
                    break;
                }
            }
        }
        //group에서 현재인원 -1, 관계제거
        group.setCurrentNum(group.getCurrentNum() - 1);
        group.getMembers().remove(member);
        //user에서 관계제거
        userRepository.findById(userPk).orElseThrow().getMembers().remove(member);
        log.info("member={},{}",member.getId(),member.getJoinAt());
        //member테이블에서 삭제(그룹 탈퇴)
        memberRepository.delete(member);
    }

    /**
     * 그룹정보를 반환하는 pk
     * @param userId 유저테이블의 pk
     * @return GroupInfoDto(그룹 id,그룹 이름, 현재 경험치, 최대 경험치)
     */
    public GroupInfoDto getGroup(Long userId, Long groupId) {
        //그룹아이디를 가져온다.
        Group group = groupRepository.findById(groupId).orElseThrow();

        //반환해야할 정보
        Boolean isLeader = false;
        for(Member member : group.getMembers()){
            if(member.getUser().getId() == userId){
                isLeader = member.getIsLeader();
            }
        }

        String name = group.getName();
        String description = group.getDescription();


        GroupInfoDto groupInfoDto = new GroupInfoDto(groupId,name, description, isLeader);
        //그룹의 현재 유저가 그룹장인지 확인한다.
        //필요한 정보들을 가져온다.
        return groupInfoDto;
    }

    /**
     * 초대코드를 조회하는 메서드
     * @param groupId
     * @return 초대코드를 담은 resDto
     */
    public CodeResDto getInviteCode(Long groupId) {
        Group group =groupRepository.findById(groupId).orElseThrow();
        return new CodeResDto(group.getCode());
    }

    /**
     * 그룹명을 변경하는 메서드
     * @param groupId 그룹 고유id
     * @param newGroupName 새로운 그룹명
     * @return 변경전 그룹명과, 변경이후의 그룹명을 담은 dto
     */
    public EditGroupResDto editGroupName(Long groupId, String newGroupName) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        String originalName = group.getName();
        group.setName(newGroupName);
        groupRepository.save(group);
        return new EditGroupResDto(groupId, originalName, newGroupName);
    }

    public List<Long> getUserGroupIds(User user) {
        List<Long> groupIds = memberRepository.findGroupIdsByUser(user);
        if (groupIds.isEmpty()) {
            return List.of(-1L);
        }
        return groupIds;
    }

    /**
     * 파라미터에 해당하는 그룹에 속한 유저의 리스트를 반환하는 메서드
     * @param groupId 그룹아이디
     * @return 그룹에 속한 유저의 리스트
     */
    public List<GroupMemberDto> getMemberList(Long groupId){
        List<Member> memberList = memberRepository.findAllByGroupId(groupId);
        List<GroupMemberDto> memberDtoList = new ArrayList<>();
        if(memberList.isEmpty()){
            throw new EntityNotFoundException();
        }
        for(Member member : memberList){
            GroupMemberDto groupMemberDto = new GroupMemberDto();
            groupMemberDto.setMemberId(member.getId());
            groupMemberDto.setUserId(member.getUser().getId());
            groupMemberDto.setNickname(member.getNickname());
            groupMemberDto.setIsLeader(member.getIsLeader());
            memberDtoList.add(groupMemberDto);
        }
        return memberDtoList;
    }

    public long getUserGroupsCount(String email) {
        return memberRepository.countByUserEmail(email);
    }
}
