package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.group.dto.response.CreateGroupResponseDto;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.group.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;

    /**
     * 그룹을 생성한뒤 그룹 id를 반환한다.
     *
     * @param userPk
     * @param nickname
     * @param groupName
     * @return dto
     */
    public CreateGroupResponseDto createGroup(Long userPk, String nickname, String groupName) {
//        Group newGroup = new Group();
//        //그룹을 생성한다.
//        newGroup.setName(groupName);
//        Long groupId = newGroup.getId();
//        groupRepository.save(newGroup);

        //해당 그룹에 생성자를 가입시킨다.
        //1.생성한 사람을 그룹에 가입시키며, 그룹장임을 표기한다.
        //2.그룹의 현재 인원을 1증가시킨다.

        return null;
    }
}
