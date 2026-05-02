import type { ComponentType } from 'react';
import type { Scenario } from '@/shared/contracts';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { eiffelTowerFranceScenario } from '@/scenarios/eiffelTowerFrance';
import { parisCoffeeShopScenario } from '@/scenarios/parisCoffeeShop';
import { AirportScene } from '@/world/AirportScene';
import { airportWorldLayout } from '@/world/airportLayout';
import { CoffeeShopScene } from '@/world/CoffeeShopScene';
import { coffeeShopWorldLayout } from '@/world/coffeeShopLayout';
import { EiffelTowerScene } from '@/world/EiffelTowerScene';
import { eiffelTowerWorldLayout } from '@/world/eiffelTowerLayout';
import type { WorldLayout, WorldSceneProps } from '@/world/worldLayout';

export interface PlayDestination {
  id: string;
  scenario: Scenario;
  layout: WorldLayout;
  Scene: ComponentType<WorldSceneProps>;
}

export const playDestinations: Record<string, PlayDestination> = {
  france: {
    id: 'france',
    scenario: airportFranceScenario,
    layout: airportWorldLayout,
    Scene: AirportScene,
  },
  'airport-france': {
    id: 'airport-france',
    scenario: airportFranceScenario,
    layout: airportWorldLayout,
    Scene: AirportScene,
  },
  'france-eiffel_tour': {
    id: 'france-eiffel_tour',
    scenario: eiffelTowerFranceScenario,
    layout: eiffelTowerWorldLayout,
    Scene: EiffelTowerScene,
  },
  'france-coffee_shop': {
    id: 'france-coffee_shop',
    scenario: parisCoffeeShopScenario,
    layout: coffeeShopWorldLayout,
    Scene: CoffeeShopScene,
  },
};

export function resolvePlayDestination(slug: string | null | undefined): PlayDestination {
  return playDestinations[slug ?? ''] ?? playDestinations.france;
}
