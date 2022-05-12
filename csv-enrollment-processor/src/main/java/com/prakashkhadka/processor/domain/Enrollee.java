package com.prakashkhadka.processor.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * A POJO representation of Enrollee
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

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("{");
        sb.append("userId='").append(userId).append('\'');
        sb.append(", firstName='").append(firstName).append('\'');
        sb.append(", lastName='").append(lastName).append('\'');
        sb.append(", version=").append(version);
        sb.append(", insuranceCompany='").append(insuranceCompany).append('\'');
        sb.append('}');
        return sb.toString();
    }
}
