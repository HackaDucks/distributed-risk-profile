package com.rbc.rbcone.hackaduck;

import java.io.IOException;
import java.util.List;

import javax.annotation.PostConstruct;

import com.rbc.rbcone.hackaduck.model.mongo.entity.Fund;
import com.rbc.rbcone.hackaduck.model.mongo.service.AccountHolderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootApplication
public class DistributedRiskProfileApplication {

	@Autowired
	private AccountHolderService accountHolderService;
		
	private static final Logger log = LoggerFactory.getLogger(DistributedRiskProfileApplication.class);
	
	public static void main(String[] args) {
		SpringApplication.run(DistributedRiskProfileApplication.class, args);
	}
	
	@Transactional
	@PostConstruct
	public void postConstruct() throws IOException, InterruptedException{
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
		
		TypeReference<List<Fund>> fundsRef = new TypeReference<List<Fund>>() {};
		List<Fund> funds = mapper.readValue(this.getClass().getResourceAsStream("/jsonfiles/DataImport.json"), fundsRef);

        funds.get(0).toString();
	}
	
}
