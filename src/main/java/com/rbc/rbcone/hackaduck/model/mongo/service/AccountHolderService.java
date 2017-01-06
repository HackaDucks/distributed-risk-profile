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
public class AccountHolderService {

    @Autowired
    FundRepository fundRepository;

    public List<Relation> findAccountHolderByFundIdAndRegion(String fundId, final String region) {

        Fund fund =  fundRepository.findByFundIdAndRelations_ResidenceCode(fundId, region);
        List<Relation> relationsList =
                fund.getRelations().stream().filter(r -> r.getResidenceCode().equals(region))
                .sorted().collect(Collectors.toList());

        for (Relation relation : fund.getRelations()) {
            if (relation.getResidenceCode().equals(region)) {
                relationsList.add(relation);
            }
        }
        return relationsList;
    }

}
