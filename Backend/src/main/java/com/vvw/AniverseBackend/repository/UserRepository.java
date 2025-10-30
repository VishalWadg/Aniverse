package com.vvw.AniverseBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vvw.AniverseBackend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> { 
}
