package com.rbc.rbcone.hackaduck.model.mongo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class Fund {

    @Id
    @JsonProperty("fc-lf-id")
    String fundId;

    @JsonProperty("fc-lf-domiciliation")
    String domicilation;

    @JsonProperty("fc-lf-name")
    String name;

    @JsonProperty("fc-region-id")
    String region;

    @JsonProperty("ttPromotor")
    Promoter promoter;

    @JsonProperty("ttRelationEntLF")
    List<Relation> relations;

}
