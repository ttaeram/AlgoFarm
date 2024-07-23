package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.dto.response.CreateGroupResDto;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.group.repository.MemberRepository;
import com.ssafy.algoFarm.mascot.entity.Mascot;
import com.ssafy.algoFarm.mascot.repository.MascotRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
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
        Mascot defaultMascot = mascotRepository.findById(1L).orElseThrow();

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


        newGroup.countUpCurrentNum();//현재 참가인원을 증가시킨다.

        return new CreateGroupResDto(groupId,groupName,inviteCode);
    }

    public Page<Long> findUserGroupIds(String email, Pageable pageable) {
        Page<Member> memberPage = memberRepository.findByUserEmail(email, pageable);
        List<Long> groupIds = memberPage.getContent().stream()
                .map(member -> member.getGroup().getId())
                .collect(Collectors.toList());

        return new PageImpl<>(groupIds, pageable, memberPage.getTotalElements());
    }

    @Transactional
    public void addUserToGroup(String email, Long groupId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (memberRepository.existsByUserAndGroup(user, group)) {
            throw new IllegalStateException("User is already a member of this group");
        }

        Member member = new Member();
        member.setUser(user);
        member.setGroup(group);
        memberRepository.save(member);
    }


    public long getUserGroupsCount(String email) {
        return memberRepository.countByUserEmail(email);
    }
}
