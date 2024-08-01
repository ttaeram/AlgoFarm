package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GrassDataService {

    private final AlgorithmSolutionRepository algorithmSolutionRepository;

    private final GroupRepository groupRepository;

    public GrassDataService(AlgorithmSolutionRepository algorithmSolutionRepository, GroupRepository groupRepository){
        this.algorithmSolutionRepository = algorithmSolutionRepository;
        this.groupRepository = groupRepository;
    }

    /**
     * 그룹별 잔디데이터를 반환하는 메서드
     *
     * @param groupId group 고유 id
     * @return List<PieceOfGrassDto> (날짜, 커밋수, x축, y축) 리스트
     */
    public List<PieceOfGrassDto> getAllGrassData(Long groupId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        int currentYear = LocalDate.now().getYear();
        LocalDate startDate = LocalDate.of(currentYear, 1, 1);
        LocalDate endDate = LocalDate.of(currentYear, 12, 31);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // 데이터베이스에서 커밋 데이터 조회
        List<Object[]> commitData = algorithmSolutionRepository.findCommitCountByGroupId(groupId);

        // 조회된 데이터를 맵으로 변환
        Map<String, Integer> commitCountMap = commitData.stream()
                .collect(Collectors.toMap(
                        data -> ((java.sql.Date) data[0]).toLocalDate().format(formatter), // java.sql.Date를 String으로 변환
                        data -> ((Number) data[1]).intValue()
                ));

        List<PieceOfGrassDto> result = new ArrayList<>();

        // 현재 연도 날짜 순회하며 좌표와 커밋 수 계산
        int x = 0;
        int y = startDate.getDayOfWeek().getValue();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            String dateString = date.format(formatter);
            int commitCount = commitCountMap.getOrDefault(dateString, 0);
            result.add(new PieceOfGrassDto(dateString, commitCount, x, y));

            y++;
            if (y > 7) {
                y = 1;
                x++;
            }
        }

        return result;
    }
}
