package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@Slf4j
public class GrassDataService {

    private final AlgorithmSolutionRepository algorithmSolutionRepository;
    private final GroupRepository groupRepository;

    public GrassDataService(AlgorithmSolutionRepository algorithmSolutionRepository, GroupRepository groupRepository) {
        this.algorithmSolutionRepository = algorithmSolutionRepository;
        this.groupRepository = groupRepository;
    }

    /**
     * 그룹별 잔디데이터를 반환하는 메서드
     *
     * @param groupId group 고유 id
     * @return List<PieceOfGrassDto2> (날짜, 커밋수, x축, y축) 리스트
     */
    public List<PieceOfGrassDto> getAllGrassData(Long groupId) {

        groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        int currentYear = LocalDate.now().getYear();
        LocalDate startDate = LocalDate.of(currentYear, 1, 1);
        LocalDate endDate = LocalDate.of(currentYear, 12, 31);

        // 데이터베이스에서 커밋 데이터 조회
        List<PieceOfGrassDto> commitData = algorithmSolutionRepository.findCommitCountByGroupId(groupId);
        List<PieceOfGrassDto> result = new ArrayList<>();

        // 현재 연도 날짜 순회하며 좌표와 커밋 수 계산
        int x = 0;
        int y = startDate.getDayOfWeek().getValue();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            Date sqlDate = Date.valueOf(date); // LocalDate를 java.sql.Date로 변환

            // 해당 날짜에 대한 커밋 데이터를 찾음
            PieceOfGrassDto data = commitData.stream()
                    .filter(d -> d.getSubmitTime().equals(sqlDate))
                    .findFirst()
                    .orElse(new PieceOfGrassDto(sqlDate, 0L)); // 기본 커밋 수 0으로 설정

            // x, y 좌표 설정
            data.setX(x);
            data.setY(y);
            result.add(data);

            y++;
            if (y > 7) {
                y = 1;
                x++;
            }
        }

        return result;
    }
}
