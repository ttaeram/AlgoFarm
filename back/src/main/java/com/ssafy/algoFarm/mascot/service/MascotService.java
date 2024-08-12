package com.ssafy.algoFarm.mascot.service;

import com.ssafy.algoFarm.mascot.entity.Mascot;
import com.ssafy.algoFarm.mascot.repository.MascotRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MascotService {

    private final MascotRepository mascotRepository;

    public MascotService(MascotRepository mascotRepository) {
        this.mascotRepository = mascotRepository;
    }

    // 마스코트 생성
    public Mascot createMascot() {
        Mascot mascot = new Mascot();
        return mascotRepository.save(mascot);
    }

    // 마스코트 조회 (ID로)
    public Optional<Mascot> getMascotById(Long id) {
        return mascotRepository.findById(id);
    }

    // 마스코트 조회 (groupId로)
    public Optional<Mascot> getMascotByGroupId(Long groupId) { return mascotRepository.getMascotByGroupId(groupId); }

    // 모든 마스코트 조회
    public List<Mascot> getAllMascots() {
        return mascotRepository.findAll();
    }

    // 마스코트 삭제
    public void deleteMascot(Long id) {
        mascotRepository.deleteById(id);
    }
}
