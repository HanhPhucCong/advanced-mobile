package org.agromarket.agro_server.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.agromarket.agro_server.common.Unit;

import java.util.List;
@Data
@AllArgsConstructor
public class ProductCreateDTO {
    private String name;
    private String description;
    private Double price;
    private Long quantity;
    private Unit unit;
    private Long categoryId;
    private List<String> imageUrls;
}