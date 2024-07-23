package com.ssafy.group;

import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.group.repository.MemberRepository;
import com.ssafy.algoFarm.group.service.GroupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private GroupService groupService;

    private User testUser;
    private Group testGroup;

    @BeforeEach
    void setUp() {
        testUser = new User(); // 필요한 속성 설정
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testGroup = Group.testBuilder()
                .id(1L)
                .name("Test Group")
                .code("TEST123")
                .build();
    }

    @Test
    void createGroup_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        var result = groupService.createGroup(1L, "nickname", "Test Group");

        assertNotNull(result);
        assertEquals(1L, result.groupId());
        assertEquals("Test Group", result.groupName());
        assertNotNull(result.inviteCode());

        verify(groupRepository).save(any(Group.class));
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    void findUserGroupIds_ReturnsPageOfGroupIds() {
        Pageable pageable = PageRequest.of(0, 10);
        Member member1 = new Member();
        member1.setUser(testUser);
        member1.setGroup(testGroup);

        Member member2 = new Member();
        member2.setUser(testUser);
        member2.setGroup(Group.testBuilder().id(2L).build());

        List<Member> members = Arrays.asList(member1, member2);
        Page<Member> memberPage = new PageImpl<>(members, pageable, members.size());

        when(memberRepository.findByUserEmail(testUser.getEmail(), pageable)).thenReturn(memberPage);

        Page<Long> result = groupService.findUserGroupIds(testUser.getEmail(), pageable);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertTrue(result.getContent().contains(1L));
        assertTrue(result.getContent().contains(2L));

        verify(memberRepository).findByUserEmail(testUser.getEmail(), pageable);
    }

    @Test
    void addUserToGroup_Success() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(memberRepository.existsByUserAndGroup(testUser, testGroup)).thenReturn(false);

        assertDoesNotThrow(() -> groupService.addUserToGroup(testUser.getEmail(), 1L));

        verify(memberRepository).save(any(Member.class));
    }

    @Test
    void addUserToGroup_UserAlreadyInGroup() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(memberRepository.existsByUserAndGroup(testUser, testGroup)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> groupService.addUserToGroup(testUser.getEmail(), 1L));

        verify(memberRepository, never()).save(any(Member.class));
    }
}