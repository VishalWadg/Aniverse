package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AniverseBackendApplicationTests {

    @Autowired
    private UserRepository userRepository;
	@Test
	void contextLoads() {

        System.out.println(userRepository.findAll());
	}

}
