package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;

public class CommentRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private CommentService commentService;

    // @Test
    public void when_getPostCommentsThenGetComments(){
        Page page = commentService.getCommentsOfPost(UUID.randomUUID(), PageRequest.of(0, 5));
//        assertThat(page.getContent().size()).isEqualTo(2);
        page.getContent().forEach((comment) -> {
            System.out.println(comment);
        });
    }

}
