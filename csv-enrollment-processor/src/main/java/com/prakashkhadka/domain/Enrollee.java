package com.prakashkhadka.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * A POJO representation of Enrollee
 *
 * @author Prakash Khadka <br>
 * Created on: May 11, 2022
 */
@JsonPropertyOrder({"userId", "firstName", "lastName", "version", "insuranceCompany"})
public class Enrollee {
    private String userId;
    private String firstName;
    private String lastName;
    private long version;
    private String insuranceCompany;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public String getInsuranceCompany() {
        return insuranceCompany;
    }

    public void setInsuranceCompany(String insuranceCompany) {
        this.insuranceCompany = insuranceCompany;
    }
}
