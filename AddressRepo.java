package com.trannam.example05.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.trannam.example05.entity.Address;

@Repository
public interface AddressRepo extends JpaRepository<Address, Long> {
    Address findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
        String country, String state, String city, String pincode, String street, String buildingName);
}