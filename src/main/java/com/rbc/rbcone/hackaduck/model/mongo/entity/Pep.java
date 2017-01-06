package com.rbc.rbcone.hackaduck.model.mongo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
public class Pep {

    @JsonProperty("fc-pepsId")
    public String pepsId;

    @JsonProperty("fc-firstName")
    public String firstName;

    @JsonProperty("fc-lastName")
    public String lastName;

    @JsonProperty("fc-role")
    public String role;

    @JsonProperty("fc-nationality")
    public String nationality;

    @JsonProperty("fc-country")
    public String country;

    @JsonProperty("fc-relationId")
    public String relationId;
}
