package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.algo.auth.annotation.CurrentUser;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.dto.request.*;
import com.ssafy.algoFarm.group.dto.response.*;
import com.ssafy.algoFarm.group.entity.Member;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class GroupController {

    private final GroupService groupService;

    @PatchMapping("api/groups")
    @Operation(summary = "그룹명을 수정하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<EditGroupResDto>> editGroup(
            @RequestBody EditGroupReqDto request,
            @Parameter(hidden = true) @CurrentUser User user){
        EditGroupResDto response = groupService.editGroupName(request.groupId(), request.newGroupName());
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK,"그룹명 변경에 성공했습니다.",response),HttpStatus.OK);
    }

    @GetMapping("api/groups/code/{groupId}")
    @Operation(summary = "스터디그룹 초대 코드를 조회하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<CodeResDto>> getCode(
            @PathVariable("groupId") Long groupId,
            @Parameter(hidden = true) @CurrentUser User user){
        CodeResDto response = groupService.getInviteCode(groupId);
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK,"초대 코드 조회 성공",response),HttpStatus.OK);
    }


    @GetMapping("api/groups/{groupId}")
    @Operation(summary = "group정보를 조회하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<GroupInfoDto>> getGroup(@PathVariable("groupId") Long groupId
            , @Parameter(hidden = true) @CurrentUser User user) {
        GroupInfoDto response = groupService.getGroup(user.getId(), groupId);
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK, "그룹 정보 조회 성공", response), HttpStatus.OK);
    }


    /**
     * 새로운 그룹을 생성하는 api
     *
     * @return createGroupResDto(그룹 id를 가지고 있는)
     */
    @PostMapping("api/groups")
    @Operation(summary = "user가 group을 생성하는 api", description = "user가 group을 생성합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<CreateGroupResDto>> createGroup(@RequestBody CreateGroupReqDto request,
                                                                       @Parameter(hidden = true) @CurrentUser User user) {
        Long userPk = user.getId();
        String email = user.getEmail();
        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0, index);
        log.info("nickname={}", nickname);

        //TODO 정책, 한명당 하나의 그룹만 참여할 수 있다. -> 검증 로직 구현해야함.
        CreateGroupResDto response = groupService.createGroup(userPk, email, request.groupName(),request.mascotType());
        log.info("response={}", response);
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK, "그룹이 생성되었습니다.", response), HttpStatus.OK);
    }


    /**
     * 사용자가 그룹에 참가하는 api
     */
    @PostMapping("api/groups/members")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "user가 그룹에 참가하는 api", description = "user가 참가코드를 통해 스터디 그룹에 참여합니다.")
    public ResponseEntity<DataResponse<JoinGroupResDto>> joinGroup(@RequestBody JoinGroupReqDto request,
                                                                   @Parameter(hidden = true) @CurrentUser User user) {
        Long userPk = user.getId();
        String email = user.getEmail();

        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0, index);
        log.info("nickname={}", nickname);

        JoinGroupResDto response = groupService.joinGroup(userPk, nickname, request.inviteCode());
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK, "그룹에 참가하였습니다.", response), HttpStatus.OK);
    }

    @DeleteMapping("api/groups/members")
    @Operation(summary = "user가 속해있는 그룹에서 탈퇴하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> leaveGroup(@RequestBody LeaveGroupReqDto request,
                                                      @Parameter(hidden = true) @CurrentUser User user) {
        Long userPk = user.getId();
        String email = user.getEmail();
        log.info("userPK = {}, email = {}", userPk, email);
        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0, index);
        log.info("nickname={}", nickname);
        groupService.leaveGroup(userPk, request.groupId());

        return new ResponseEntity<>(MessageResponse.of(HttpStatus.OK, "스터디 그룹 탈퇴에 성공하셨습니다."), HttpStatus.OK);
    }

    /**
     * userId로 들어온 user를 그룹에서 강퇴합니다.
     * @param groupId
     * @param userPk
     * @return 그룹원 강퇴 성공에 대한 메시지, 강퇴 실패 시 강퇴 실패 메시지
     */
    @DeleteMapping("api/groups/{groupId}/members/{userId}")
    @Operation(summary = "그룹장이 그룹원을 강퇴시키는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> leaveGroupMembers(@PathVariable("groupId") Long groupId, @PathVariable("userId") Long userPk) {
        // TODO: 요청을 보낸 유저가 그룹장이 아니라면 예외처리
        log.info("groupId={}, userId={}", groupId, userPk);
        try {
            groupService.leaveGroup(userPk, groupId);
        }catch(Exception e) {
            return new ResponseEntity<>(MessageResponse.of(HttpStatus.NOT_FOUND, "그룹원 강퇴에 실패했습니다."), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(MessageResponse.of(HttpStatus.OK, "그룹원 강퇴에 성공하셨습니다."), HttpStatus.OK);
    }

    @GetMapping("api/groups/{groupId}/memberList")
    @Operation(summary = "그룹원 목록을 리턴하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<List<GroupMemberDto>>> getMemberList(@PathVariable("groupId") Long groupId){
        log.info("groupId={}", groupId);
        try {
            List<GroupMemberDto> memberDtoList = groupService.getMemberList(groupId);
            return new ResponseEntity<>(DataResponse.of(HttpStatus.OK, "멤버리스트 조회에 성공했습니다.", memberDtoList), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(DataResponse.of(HttpStatus.BAD_REQUEST, "멤버리스트 조회에 실패했습니다.", null), HttpStatus.BAD_REQUEST);
        }
    }


    /**
     * 현재 사용자가 속한 모든 그룹의 ID 목록을 조회합니다.
     * 사용자가 속한 그룹이 없는 경우, -1을 포함하는 리스트를 반환합니다.
     *
     * @param user 그룹 목록을 조회할 현재 사용자 객체
     * @return 사용자가 속한 그룹의 ID 목록. 그룹이 없으면 -1을 포함하는 리스트 반환
     * @throws IllegalArgumentException user 파라미터가 null인 경우
     */
    @GetMapping("api/user/groups")
    @Operation(summary = "사용자가 속한 그룹 목록 조회", description = "현재 사용자가 속한 모든 그룹의 ID 목록을 반환합니다. 그룹이 없으면 -1을 포함하는 리스트를 반환합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<List<Long>>> getUserGroups(
            @Parameter(hidden = true) @CurrentUser User user) {

        List<Long> groupIds = groupService.getUserGroupIds(user);

        String message = groupIds.get(0) == -1L
                ? "사용자가 속한 그룹이 없습니다."
                : "사용자의 그룹 ID 목록을 성공적으로 조회했습니다.";

        DataResponse<List<Long>> response = DataResponse.of(
                HttpStatus.OK,
                message,
                groupIds
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("api/groups/members/nickname")
    @Operation(summary = "그룹 내 닉네임 변경", description = "현재 사용자가 그룹 내에서 사용할 닉네임을 변경합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> changeNickname(@RequestBody ChangeNicknameReqDto changeNicknameReqDto, @Parameter(hidden = true) @CurrentUser User user){
        groupService.changeNickname(user.getId(), changeNicknameReqDto);
        return new ResponseEntity<>(MessageResponse.of(HttpStatus.OK, "닉네임이 변경되었습니다."), HttpStatus.OK);
    }

}
