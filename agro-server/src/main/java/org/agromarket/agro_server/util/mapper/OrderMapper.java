package org.agromarket.agro_server.util.mapper;

import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.model.dto.response.CouponResponse;
import org.agromarket.agro_server.model.dto.response.LineItemReponse;
import org.agromarket.agro_server.model.dto.response.OrderResponse;
import org.agromarket.agro_server.model.entity.Order;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    private final ModelMapper mapper;
    private final LineItemMapper lineItemMapper;
    private final CouponMapper couponMapper;

    public OrderResponse convertToResponse(Order order) {
        List<LineItemReponse> lineItemReponseList = order.getLineItems().stream()
                .map(lineItemMapper::convertToResponse)
                .toList();

        OrderResponse response = mapper.map(order, OrderResponse.class);
        response.setUserId(order.getUser().getId());
        response.setLineItems(lineItemReponseList);
        if (order.getCoupon() != null) {
            CouponResponse couponResponse = couponMapper.convertToResponse(order.getCoupon());
            response.setCoupon(couponResponse);
        }

        return response;
    }

}
