package com.vvw.AniverseBackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.vvw.AniverseBackend.client.GithubClient;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;

import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.FeedbackGroup;
import com.vvw.AniverseBackend.repository.FeedbackGroupRepository;
import com.vvw.AniverseBackend.repository.FeedbackRepository;
import com.vvw.AniverseBackend.service.FeedbackGroupingService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

public class FeedbackGroupingConcurrencyTest extends AbstractIntegrationTest {
    @Autowired
    private FeedbackGroupingService feedbackGroupingService;
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private FeedbackGroupRepository feedbackGroupRepository;

    @MockitoBean
    private GithubClient githubClient;

    @Test
    void shouldCreateOnlyOneGroupWhenConcurrentFeedbacksArrive() throws Exception {
        int numberOfFeedbacks = 5;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfFeedbacks);
        // 1. Create a 768-dimension embedding vector
        float[] identicalEmbedding = new float[768];
        identicalEmbedding[0] = 0.5f;
        identicalEmbedding[1] = 0.5f;
        // 2. Persist raw un-grouped feedbacks in the database
        List<Feedback> savedFeedbacks = new ArrayList<>();
        for (int i = 1; i <= numberOfFeedbacks; i++) {
            Feedback feedback = Feedback.builder()
                    .content("Hero carousel sliding issue report #" + i)
                    .build();
            savedFeedbacks.add(feedbackRepository.save(feedback));
        }
        // 3. Set up concurrency gates
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneGate = new CountDownLatch(numberOfFeedbacks);
        // 4. Submit parallel tasks
        for (Feedback feedback : savedFeedbacks) {
            executor.submit(() -> {
                try {
                    startGate.await(); // wait for the starting pistol
                    feedbackGroupingService.assignFeedbackToGroup(feedback.getId(), identicalEmbedding);
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    doneGate.countDown();
                }
            });
        }
        // 5. Open the starting gate to release all threads simultaneously
        startGate.countDown();
        // 6. Wait for all threads to complete
        boolean finished = doneGate.await(10, TimeUnit.SECONDS);
        assertThat(finished).isTrue();
        executor.shutdown();
        // 7. Verification: The PostgreSQL advisory lock should guarantee exactly ONE
        // group was created
        List<FeedbackGroup> groups = feedbackGroupRepository.findAll();
        assertEquals(1, groups.size(), "Expected exactly 1 group to be created for concurrent identical feedbacks");
        FeedbackGroup createdGroup = groups.get(0);
        // Verify all feedbacks now point to that same single group
        List<Feedback> updatedFeedbacks = feedbackRepository.findAll();
        assertThat(updatedFeedbacks).hasSize(numberOfFeedbacks);
        for (Feedback f : updatedFeedbacks) {
            assertNotNull(f.getGroup());
            assertEquals(createdGroup.getId(), f.getGroup().getId());
            assertNotNull(f.getEmbedding());
        }
    }
}
