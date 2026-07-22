import { Component } from '@angular/core';

const PORTAL_URL = 'https://www.iess.gob.ec/afiliado-web/pages/principal.jsf';

interface PasoExtension {
  numero: number;
  fragmentos: { texto: string; enlace?: string }[];
}

@Component({
  selector: 'app-extension-cobertura',
  imports: [],
  templateUrl: './extension-cobertura.component.html',
  styleUrl: './extension-cobertura.component.scss'
})
export class ExtensionCoberturaComponent {
  readonly sectionTitle = '¿Cómo solicitar la extensión de cobertura?';

  readonly sectionSummary =
    'El afiliado, pensionista o jubilado que desea la cobertura de salud para su dependiente (cónyuge o conviviente, hijos menores de 18 años de pensionistas) debe ingresar a la página web del IESS con el usuario y clave del afiliado:';

  readonly pasos: PasoExtension[] = [
    {
      numero: 1,
      fragmentos: [
        { texto: 'Ingrese a ' },
        { texto: 'www.iess.gob.ec', enlace: 'https://www.iess.gob.ec' }
      ]
    },
    {
      numero: 2,
      fragmentos: [{ texto: 'De clic en “Asegurados”' }]
    },
    {
      numero: 3,
      fragmentos: [{ texto: 'Seleccione la opción “Afiliados”' }]
    },
    {
      numero: 4,
      fragmentos: [{ texto: 'Ingrese el número de cédula y clave personal' }]
    },
    {
      numero: 5,
      fragmentos: [
        { texto: 'Clic en “Solicitud ' },
        { texto: 'Extensión de Cobertura', enlace: PORTAL_URL },
        { texto: '”' }
      ]
    },
    {
      numero: 6,
      fragmentos: [
        {
          texto:
            'En el menú seleccione “Extensión de Cobertura de Salud” y elija “Solicitud de Extensión de Salud para cónyuges/hijos”'
        }
      ]
    }
  ];
}
