package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.group.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    /**
     * 새로운 그룹을 생성하는 api
     * @return
     */
//    @GetMapping("api/groups")
//    public ResponseEntity<> createGroup(){
//
//    }

}
