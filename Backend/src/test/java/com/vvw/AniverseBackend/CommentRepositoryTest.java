package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
//@RequiredArgsConstructor
public class CommentRepositoryTest {

    @Autowired
    private CommentService commentService;

    @Test
    public void when_getPostCommentsThenGetComments(){
        Page page = commentService.getCommentsOfPost(1L, PageRequest.of(0, 5));
//        assertThat(page.getContent().size()).isEqualTo(2);
        page.getContent().forEach((comment) -> {
            System.out.println(comment);
        });
    }

}
