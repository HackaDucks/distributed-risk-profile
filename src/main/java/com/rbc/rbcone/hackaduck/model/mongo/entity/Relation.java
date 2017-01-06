package com.rbc.rbcone.hackaduck.model.mongo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
@Document
public class Relation {

    @JsonProperty("fc-relationId")
    public String relationId;

    @JsonProperty("fc-bp-id")
    public String bpId;

    @JsonProperty("fc-lf-id")
    public String legalFundId;

    @JsonProperty("fc-acc-id")
    public String accountId;

    @JsonProperty("fc-rad")
    public String rad;

    @JsonProperty("fc-relationType")
    public String relationType;

    @JsonProperty("fc-distriutionType")
    public String distributionType;

    @JsonProperty("fi-nb-acc")
    public Integer nbAcc;

    @JsonProperty("fde-asset-value")
    public Double assetValue;

    @JsonProperty("fc-residence-code")
    public String residenceCode;

    @JsonProperty("fc-name")
    public String name;

    @JsonProperty("fc-nature")
    public String nature;

    @JsonProperty("fc-type")
    public String type;

    @JsonProperty("ttPeps")
    public List<Pep> peps;

}
