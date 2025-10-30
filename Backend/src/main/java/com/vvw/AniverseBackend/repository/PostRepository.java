package com.vvw.AniverseBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vvw.AniverseBackend.entity.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

}
