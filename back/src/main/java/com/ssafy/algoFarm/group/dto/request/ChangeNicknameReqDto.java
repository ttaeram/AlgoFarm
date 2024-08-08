package com.ssafy.algoFarm.group.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeNicknameReqDto {
    private String newNickname;
    private Long groupId;
}
