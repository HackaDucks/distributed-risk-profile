package com.rbc.rbcone.hackaduck.model.mongo.service;

import com.rbc.rbcone.hackaduck.model.mongo.entity.AccountHolder;
import com.rbc.rbcone.hackaduck.model.mongo.entity.Fund;
import com.rbc.rbcone.hackaduck.model.mongo.entity.Relation;
import com.rbc.rbcone.hackaduck.model.mongo.repository.FundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelationService {

    @Autowired
    FundRepository fundRepository;

    public List<Relation> findRelationByFundIdAndResidenceCode(String fundId, final String residenceCode) {

        Fund fund = fundRepository.findByFundIdAndRelationsResidenceCode(fundId, "LU");

        List<Relation> relationsList =
                fund.getRelations().stream().filter(r -> r.getResidenceCode().equals(residenceCode))
                .sorted().collect(Collectors.toList());

        return relationsList;
    }

}
