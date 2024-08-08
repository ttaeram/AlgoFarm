package com.ssafy.algoFarm.algo.user;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void withdraw(Long userId){
        userRepository.delete(userRepository.findById(userId).orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_FOUND)));
    }
}
