package org.agromarket.agro_server.model.dto.response;

import java.util.List;
import lombok.*;
import org.agromarket.agro_server.common.Unit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse extends BaseResponseDTO {
  private String name;
  private String description;
  private Double price;
  private Long quantity;
  private Unit unit;
  private Long purchaseCount;
  private Long categoryId;
  private List<String> imageUrls;
  private List<Long> reviewIds;
  private List<Long> favoriteIds;
}
