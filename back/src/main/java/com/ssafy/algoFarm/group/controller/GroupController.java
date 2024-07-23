package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.algo.auth.CurrentUser;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.dto.request.CreateGroupReqDto;
import com.ssafy.algoFarm.group.dto.request.JoinGroupReqDto;
import com.ssafy.algoFarm.group.dto.request.LeaveGroupReqDto;
import com.ssafy.algoFarm.group.dto.response.CreateGroupResDto;
import com.ssafy.algoFarm.group.dto.response.JoinGroupResDto;
import com.ssafy.algoFarm.group.service.GroupService;
import com.ssafy.global.response.DataResponse;
import com.ssafy.global.response.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class GroupController {

    private final GroupService groupService;
    /**
     * 새로운 그룹을 생성하는 api
     * @return createGroupResDto(그룹 id를 가지고 있는)
     */
    @PostMapping("api/groups")
    @Operation(summary = "user가 group을 생성하는 api", description = "user가 group을 생성합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<CreateGroupResDto>> createGroup(@RequestBody CreateGroupReqDto request,
                                                                       @Parameter(hidden = true) @CurrentUser User user){
        Long userPk = user.getId();
        String email = user.getEmail();
        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0,index);
        log.info("nickname={}",nickname);

        //TODO 정책, 한명당 하나의 그룹만 참여할 수 있다. -> 검증 로직 구현해야함.
        CreateGroupResDto response = groupService.createGroup(userPk, email, request.groupName());
        log.info("response={}",response);
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK,"그룹이 생성되었습니다.", response), HttpStatus.OK);
    }

    /**
     * 사용자가 그룹에 참가하는 api
     */
    @PostMapping("api/groups/members")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "user가 그룹에 참가하는 api", description = "user가 참가코드를 통해 스터디 그룹에 참여합니다.")
    public ResponseEntity<DataResponse<JoinGroupResDto>> joinGroup(@RequestBody JoinGroupReqDto request,
                                                                   @Parameter(hidden = true) @CurrentUser User user){
        Long userPk = user.getId();
        String email = user.getEmail();

        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0,index);
        log.info("nickname={}",nickname);

        JoinGroupResDto response = groupService.joinGroup(userPk, nickname, request.inviteCode());
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK,"그룹에 참가하였습니다.",response),HttpStatus.OK);
    }

    @DeleteMapping("api/groups/members")
    @Operation(summary = "user가 속해있는 그룹에서 탈퇴하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> leaveGroup(@RequestBody LeaveGroupReqDto request,
                                                      @Parameter(hidden = true) @CurrentUser User user){
        Long userPk = user.getId();
        String email = user.getEmail();
        log.info("userPK = {}, email = {}", userPk, email);
        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0,index);
        log.info("nickname={}",nickname);
        groupService.leaveGroup(userPk, request.groupId());

        return new ResponseEntity<>(MessageResponse.of(HttpStatus.OK,"스터디 그룹 탈퇴에 성공하셨습니다."),HttpStatus.OK);
    }

}
