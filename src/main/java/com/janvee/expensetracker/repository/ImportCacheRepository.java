package com.janvee.expensetracker.repository;

import com.janvee.expensetracker.entity.ImportCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportCacheRepository extends JpaRepository<ImportCache, Long> {
    List<ImportCache> findByGroupIdAndResolvedFalseAndIgnoredFalse(Long groupId);
    List<ImportCache> findByGroupId(Long groupId);
}
