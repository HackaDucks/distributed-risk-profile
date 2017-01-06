package com.rbc.rbcone.hackaduck.model.mongo.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
@Document
public class AccountHolder {

    public String residenceCode;
    public String region;
    public String name;
    public String type;
    public String nature;
    public String distributionType;
    public String rad;
    public Integer assetValue;
    public String relationType;
    public Integer accountNumber;
    public List<Pep> peps;

}
