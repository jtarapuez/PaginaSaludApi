import { Component } from '@angular/core';

interface TarjetaEnlace {
  titulo: string;
  imagen: string;
  enlace: string;
  variante: 'clara' | 'azul';
}

@Component({
  selector: 'app-como-validar',
  imports: [],
  templateUrl: './como-validar.component.html',
  styleUrl: './como-validar.component.scss'
})
export class ComoValidarComponent {
  readonly tarjetas: TarjetaEnlace[] = [
    {
      titulo: '¿Cómo validar un certificado médico?',
      imagen: 'assets/images/img_validacion_certificado.png',
      enlace:
        'https://www.iess.gob.ec/es/web/mobile/afiliado/-/asset_publisher/l1qX/content/quieres-validar-un-certificado-medico-de-manera-presencial/10174?redirect=https%3A%2F%2Fwww.iess.gob.ec%2Fes%2Fweb%2Fmobile%2Fafiliado%3Fp_p_id%3D101_INSTANCE_l1qX%26p_p_lifecycle%3D0%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_p_col_id%3Dcolumn-1%26p_p_col_count%3D1',
      variante: 'clara'
    },
    {
      titulo: 'Todo lo que debe saber sobre el subsidio de maternidad',
      imagen: 'assets/images/img_subsisio_maternidad.png',
      enlace:
        'https://www.iess.gob.ec/es/web/mobile/home/-/asset_publisher/0hbG/content/todo-lo-que-debe-saber-sobre-el-subsidio-de-maternidad/10174?redirect=https%3A%2F%2Fwww.iess.gob.ec%2Fes%2Fweb%2Fmobile%2Fhome%3Fp_p_id%3D101_INSTANCE_0hbG%26p_p_lifecycle%3D0%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_p_col_id%3Dcolumn-1%26p_p_col_count%3D1',
      variante: 'azul'
    }
  ];
}
