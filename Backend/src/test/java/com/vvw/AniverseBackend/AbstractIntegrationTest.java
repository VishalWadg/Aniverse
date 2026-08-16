package com.vvw.AniverseBackend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer<?> postgres;

    static {
        postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg16");
        postgres.start();
    }
}
