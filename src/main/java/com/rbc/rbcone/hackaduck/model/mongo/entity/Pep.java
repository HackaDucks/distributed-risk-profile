package com.rbc.rbcone.hackaduck.model.mongo.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
public class Pep {

    public String firstName;
    public String lastName;
    public String role;
    public String nationality;
    public String country;
}
