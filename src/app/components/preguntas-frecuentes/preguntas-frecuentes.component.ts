import { Component } from '@angular/core';

interface PreguntaFrecuente {
  pregunta: string;
  parrafos?: string[];
  bullets?: string[];
  pasos?: string[];
}

@Component({
  selector: 'app-preguntas-frecuentes',
  imports: [],
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrl: './preguntas-frecuentes.component.scss'
})
export class PreguntasFrecuentesComponent {
  readonly sectionTitle = 'Preguntas frecuentes';

  readonly preguntas: PreguntaFrecuente[] = [
    {
      pregunta: '¿En qué tiempo puedo recibir atención médica después de mi afiliación?',
      parrafos: [
        'Al afiliarse al IESS, tendrá derecho a atención médica a los tres meses de aportación continua.'
      ],
      bullets: [
        'Si se afilia por primera tendrá derecho a la atención por enfermedad a los tres meses de aporte.',
        'Si el afiliado quedó cesante por más de dos meses recupera el derecho a la atención por enfermedad con un mes de aporte.'
      ]
    },
    {
      pregunta:
        '¿Si estoy recién afiliado puedo recibir atención de emergencia? ¿En qué casos y en qué unidades médicas?',
      parrafos: [
        'Las personas recién afiliadas al IESS sí pueden recibir atención de emergencia, incluso si aún no cumplen con el tiempo mínimo de aportaciones (tres meses) para acceder a otros servicios de salud. En caso de emergencia, la atención es prioritaria y se presta en las áreas de Emergencia de cualquier unidad médica del IESS.'
      ]
    },
    {
      pregunta: '¿Puedo acceder a atención médica aun cuando mi empleador esté en mora?',
      parrafos: [
        'Sí, aun cuando el empleador se encuentre en mora el afiliado tiene derecho a acceder a atención médica en el IESS. Posterior a la atención médica se generará la respectiva responsabilidad patronal a cargo del empleador por no haber cancelado el aporte.'
      ]
    },
    {
      pregunta: '¿Qué especialidades puedo agendar a través de la página web del IESS?',
      bullets: [
        'Medicina General',
        'Medicina Familiar',
        'Psicología',
        'Pediatría',
        'Ginecología',
        'Obstetricia',
        'Odontología'
      ]
    },
    {
      pregunta: '¿Cómo se registran dependientes?',
      parrafos: [
        'El afiliado, pensionista o jubilado que desea la cobertura de salud para su dependiente (cónyuge o conviviente, hijos menores de 18 años de pensionistas) debe registrarlo ingresando al sistema del IESS con su usuario y clave personal y seguir los siguientes pasos:'
      ],
      pasos: [
        'Ingrese a www.iess.gob.ec',
        'De clic en “Asegurados”',
        'Seleccione la opción “Afiliados”',
        'Ingrese el número de cédula y clave personal',
        'Clic en “Información”',
        'Elija “Registro de dependientes”'
      ]
    }
  ];

  private readonly abiertos = new Set<number>([0]);

  estaAbierta(indice: number): boolean {
    return this.abiertos.has(indice);
  }

  alternar(indice: number): void {
    if (this.abiertos.has(indice)) {
      this.abiertos.delete(indice);
      return;
    }

    this.abiertos.add(indice);
  }
}
