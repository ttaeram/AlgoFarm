package com.ssafy.algoFarm.algo.user;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfo {
    private Long user_id;
    private String email;
    private boolean email_verified;
    private String name;
    private String provider;
}
