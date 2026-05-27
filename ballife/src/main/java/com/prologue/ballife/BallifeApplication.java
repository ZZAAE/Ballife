package com.prologue.ballife;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BallifeApplication {
	// 뉴스 30분 주기로 가져옴 
	public static void main(String[] args) {
		SpringApplication.run(BallifeApplication.class, args);
	}

}
