import { inject, Injectable, signal, type WritableSignal } from '@angular/core';
import { sortBy } from 'lodash';
import type { IChangelogEntry } from '../../interfaces';
import { environment } from '../environments/environment';
import { LocaleService } from './locale.service';

@Injectable({
  providedIn: 'root',
})
export class ChangelogService {
  private localeService = inject(LocaleService);

  private changelogByProductIdAndLocale: WritableSignal<
    Record<string, Record<string, IChangelogEntry[]>>
  > = signal({});

  public async init() {
    const faqData = await fetch(`${environment.baseUrl}/changelog.json`);
    const realData = await faqData.json();

    this.parseLocaleFAQs(realData);
  }

  private parseLocaleFAQs(
    faqData: Record<string, Record<string, IChangelogEntry[]>>
  ) {
    const baseChangelogs = this.changelogByProductIdAndLocale();

    Object.keys(faqData).forEach((productId) => {
      baseChangelogs[productId] ??= {};

      Object.keys(faqData[productId]).forEach((locale) => {
        baseChangelogs[productId][locale] = sortBy(
          faqData[productId][locale],
          'date'
        );
      });
    });

    this.changelogByProductIdAndLocale.set(baseChangelogs);
  }

  public getChangelogs(): Array<{
    productId: string;
    locale: string;
    changelog: IChangelogEntry[];
  }> {
    const changelogData = this.changelogByProductIdAndLocale();
    const locale = this.localeService.currentLocale();

    return Object.keys(changelogData)
      .map((productId) => ({
        productId,
        locale,
        changelog: changelogData[productId][locale],
      }))
      .filter((p) => p.changelog)
      .flat();
  }

  public getProductChangelog(
    productId: string,
    locale: string
  ): IChangelogEntry[] | undefined {
    const changelog = this.changelogByProductIdAndLocale();
    return changelog?.[productId]?.[locale];
  }
}