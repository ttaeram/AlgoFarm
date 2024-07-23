package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.algo.user.UserInfo;
import com.ssafy.algoFarm.group.dto.request.CreateGroupReqDto;
import com.ssafy.algoFarm.group.dto.response.CreateGroupResDto;
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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Slf4j
public class GroupController {

    private final GroupService groupService;

    /**
     * 새로운 그룹을 생성하는 api
     * @return createGroupResDto(그룹 id를 가지고 있는)
     */
    @PostMapping("api/groups")
    public ResponseEntity<DataResponse<CreateGroupResDto>> createGroup(@RequestBody CreateGroupReqDto request){
        //TODO securityContextHolder의 customUserDto에서 user의 pk, email을 가져와야함.
        Long userPk = 1L;
        String email = "email@gmial.com";
        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0,index);
        log.info("nickname={}",nickname);

        //TODO 정책, 한명당 하나의 그룹만 참여할 수 있다. -> 검증 로직 구현해야함.
        CreateGroupResDto response = groupService.createGroup(userPk, email, request.groupName());
        log.info("response={}",response);
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK,"그룹이 생성되었습니다.", response), HttpStatus.OK);
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
