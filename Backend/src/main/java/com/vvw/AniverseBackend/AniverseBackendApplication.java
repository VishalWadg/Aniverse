package com.vvw.AniverseBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AniverseBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AniverseBackendApplication.class, args);
	}

}
