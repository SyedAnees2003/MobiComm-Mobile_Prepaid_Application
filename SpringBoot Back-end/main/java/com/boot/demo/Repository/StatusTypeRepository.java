package com.boot.demo.Repository;

import com.boot.demo.Model.StatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StatusTypeRepository extends JpaRepository<StatusType, Integer> {
    Optional<StatusType> findByStatusName(String statusName);
}
