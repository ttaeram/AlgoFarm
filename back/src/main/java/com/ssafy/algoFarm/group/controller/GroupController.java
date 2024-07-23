package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.group.dto.request.CreateGroupReqDto;
import com.ssafy.algoFarm.group.dto.request.JoinGroupReqDto;
import com.ssafy.algoFarm.group.dto.request.LeaveGroupReqDto;
import com.ssafy.algoFarm.group.dto.response.CreateGroupResDto;
import com.ssafy.algoFarm.group.dto.response.JoinGroupResDto;
import com.ssafy.algoFarm.group.service.GroupService;
import com.ssafy.global.response.DataResponse;
import com.ssafy.global.response.MessageResponse;
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

    /**
     * 사용자가 그룹에 참가하는 api
     */
    @PostMapping("api/groups/members")
    public ResponseEntity<DataResponse<JoinGroupResDto>> joinGroup(@RequestBody JoinGroupReqDto request){
        //TODO securityContextHolder의 customUserDto에서 user의 pk, email을 가져와야함.
        Long userPk = 1L;
        String email = "email@gmial.com";

        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0,index);
        log.info("nickname={}",nickname);

        JoinGroupResDto response = groupService.joinGroup(userPk, nickname, request.inviteCode());
        return new ResponseEntity<>(DataResponse.of(HttpStatus.OK,"그룹에 참가하였습니다.",response),HttpStatus.OK);
    }

    @DeleteMapping("api/groups/members")
    public ResponseEntity<MessageResponse> leaveGroup(@RequestBody LeaveGroupReqDto request){
        //TODO securityContextHolder의 customUserDto에서 user의 pk, email을 가져와야함.
        Long userPk = 1L;
        String email = "email@gmial.com";

        //email에서 앞부분 추출
        int index = email.indexOf("@");
        String nickname = email.substring(0,index);
        log.info("nickname={}",nickname);
        groupService.leaveGroup(userPk,request.groupId());

        return null;
    }

}
