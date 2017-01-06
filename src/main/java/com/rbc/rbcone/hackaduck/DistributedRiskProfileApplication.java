package com.rbc.rbcone.hackaduck;

import java.io.File;
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

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rbc.rbcone.hackaduck.model.country.Country;
import com.rbc.rbcone.hackaduck.model.country.Region;
import com.rbc.rbcone.hackaduck.model.country.repository.CountryRepository;
import com.rbc.rbcone.hackaduck.model.country.repository.RegionRepository;
import com.rbc.rbcone.hackaduck.model.incoming.SaraEntity;
import com.rbc.rbcone.hackaduck.model.incoming.SaraLegalFund;
import com.rbc.rbcone.hackaduck.model.incoming.SaraRelation;
import com.rbc.rbcone.hackaduck.model.incoming.SaraPeps;
import com.rbc.rbcone.hackaduck.model.incoming.repository.SaraEntityRepository;
import com.rbc.rbcone.hackaduck.model.incoming.repository.SaraLegalFundRepository;
import com.rbc.rbcone.hackaduck.model.incoming.repository.SaraPepsRepository;
import com.rbc.rbcone.hackaduck.model.incoming.repository.SaraRelationRepository;
import com.rbc.rbcone.hackaduck.model.incoming.service.BusinessDataService;

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
		List<Fund> funds = mapper.readValue(this.getClass().getResourceAsStream("/jsonfiles/DataImport"), fundsRef);

        funds.get(0).toString();


	}
	
}
