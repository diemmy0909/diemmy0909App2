package com.trannam.example05.payloads;

import java.util.*;
import com.trannam.example05.entity.Role;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class UserDTO {
    private Long userId;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String password;
    private Set<Role> roles = new HashSet<>();
    private AddressDTO address;
    // Thêm trường này để nhận dữ liệu Giỏ hàng
    private CartDTO cart; 
}