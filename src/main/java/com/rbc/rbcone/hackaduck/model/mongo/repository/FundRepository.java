package com.rbc.rbcone.hackaduck.model.mongo.repository;

import com.rbc.rbcone.hackaduck.model.mongo.entity.Fund;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FundRepository extends MongoRepository<Fund, String> {

    List<Fund> findByDomicilation(String domicilation);

    List<Fund> findByRelations_ResidenceCode(String region);

    Fund findByFundIdAndRelations_ResidenceCode(String fundId, String residenceCode);

}
