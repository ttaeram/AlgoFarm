package com.ssafy.group;

import com.ssafy.algoFarm.algo.auth.JwtUtil;
import com.ssafy.algoFarm.group.dto.response.CreateGroupResDto;
import com.ssafy.algoFarm.group.service.GroupService;
import com.ssafy.global.response.DataResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GroupService groupService;

    @MockBean
    private JwtUtil jwtUtil;

    private String userToken;

    @BeforeEach
    void setUp() {
        userToken = "dummy_token";
        when(jwtUtil.getEmailFromToken(userToken)).thenReturn("user@example.com");
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void getUserGroups_WhenUserHasNoGroups() throws Exception {
        when(groupService.findUserGroupIds(eq("user@example.com"), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/user/groups")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("사용자가 속한 그룹이 없습니다."))
                .andExpect(jsonPath("$.data.groupIds").isEmpty());
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void getUserGroups_WhenUserHasGroups() throws Exception {
        Page<Long> groupIds = new PageImpl<>(Arrays.asList(1L, 2L));
        when(groupService.findUserGroupIds(eq("user@example.com"), any()))
                .thenReturn(groupIds);

        mockMvc.perform(get("/api/user/groups")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("사용자의 그룹을 찾았습니다."))
                .andExpect(jsonPath("$.data.groupIds").isArray())
                .andExpect(jsonPath("$.data.groupIds[0]").value(1))
                .andExpect(jsonPath("$.data.groupIds[1]").value(2));
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void createGroup_Success() throws Exception {
        when(groupService.createGroup(anyLong(), anyString(), anyString()))
                .thenReturn(new CreateGroupResDto(1L, "Test Group", "inviteCode123"));

        mockMvc.perform(post("/api/groups")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"groupName\":\"Test Group\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("그룹이 생성되었습니다."))
                .andExpect(jsonPath("$.data.groupId").value(1))
                .andExpect(jsonPath("$.data.groupName").value("Test Group"))
                .andExpect(jsonPath("$.data.inviteCode").value("inviteCode123"));
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void createGroup_WhenUserAlreadyInGroup() throws Exception {
        when(groupService.createGroup(anyLong(), anyString(), anyString()))
                .thenThrow(new IllegalStateException("User is already a member of a group"));

        mockMvc.perform(post("/api/groups")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"groupName\":\"Test Group\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User is already a member of a group"));
    }
}