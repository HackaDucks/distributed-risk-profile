package com.rbc.rbcone.hackaduck.model.mongo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
public class Promoter {

    @JsonProperty("fc-region-id")
    String regionId;

    @JsonProperty ("fc-name")
    String name;
}
