import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class AuthGateway {
  //   constructor(private readonly authService: AuthService) {}
  //   @SubscribeMessage('createAuth1')
  //   create(@MessageBody() createAuth1Dto: CreateAuth1Dto) {
  //     return this.authService.create(createAuth1Dto);
  //   }
  //   @SubscribeMessage('findAllAuth1')
  //   findAll() {
  //     return this.authService.findAll();
  //   }
  //   @SubscribeMessage('findOneAuth1')
  //   findOne(@MessageBody() id: number) {
  //     return this.authService.findOne(id);
  //   }
  //   @SubscribeMessage('updateAuth1')
  //   update(@MessageBody() updateAuth1Dto: UpdateAuth1Dto) {
  //     return this.authService.update(updateAuth1Dto.id, updateAuth1Dto);
  //   }
  //   @SubscribeMessage('removeAuth1')
  //   remove(@MessageBody() id: number) {
  //     return this.authService.remove(id);
  //   }
}
