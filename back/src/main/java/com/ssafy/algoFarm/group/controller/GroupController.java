package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.algo.user.UserInfo;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.dto.request.CreateGroupReqDto;
import com.ssafy.algoFarm.group.dto.response.CreateGroupResDto;
import com.ssafy.algoFarm.group.repository.MemberRepository;
import com.ssafy.algoFarm.group.service.GroupService;
import com.ssafy.global.response.DataResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Slf4j
public class GroupController {

    private final GroupService groupService;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;

    /**
     * 새로운 그룹을 생성하는 api
     * @return createGroupResDto(그룹 id를 가지고 있는)
     */
    @PostMapping("api/groups")
    @Operation(summary = "Create a new group")
    @ApiResponse(responseCode = "200", description = "Group created successfully")
    @ApiResponse(responseCode = "400", description = "User already in a group")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<CreateGroupResDto>> createGroup(@RequestBody CreateGroupReqDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // email에서 앞부분 추출하여 nickname으로 사용
        String nickname = email.substring(0, email.indexOf("@"));
        log.info("nickname={}", nickname);

        // 사용자가 이미 그룹에 속해 있는지 확인
        if (memberRepository.existsByUserId(user.getId())) {
            throw new IllegalStateException("User is already a member of a group");
        }

        CreateGroupResDto response = groupService.createGroup(user.getId(), nickname, request.groupName());
        log.info("response={}", response);
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK, "그룹이 생성되었습니다.", response), HttpStatus.OK);
    }

    @GetMapping("api/user/group")
    @Operation(summary = "Get user's group")
    @ApiResponse(responseCode = "200", description = "Successful operation",
            content = @Content(schema = @Schema(implementation = Long.class)))
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<?>> getUserGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Pageable pageable = PageRequest.of(page, size);
        Page<Long> groupIds = groupService.findUserGroupIds(email, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("groupIds", groupIds.getContent());
        response.put("currentPage", groupIds.getNumber());
        response.put("totalItems", groupIds.getTotalElements());
        response.put("totalPages", groupIds.getTotalPages());

        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK, "사용자의 그룹을 찾았습니다.", response), HttpStatus.OK);
    }


}
