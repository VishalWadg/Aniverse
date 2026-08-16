package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class AniverseBackendApplicationTests extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;
	@Test
	void contextLoads() {

        System.out.println(userRepository.findAll());
	}

}
