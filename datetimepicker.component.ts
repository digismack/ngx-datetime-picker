import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

@Component({
    selector: 'app-datetimepicker',
    templateUrl: './datetimepicker.component.html',
    styleUrls: ['./datetimepicker.component.scss']
})
export class DatetimepickerComponent implements OnInit {

    @Input() value = moment().startOf('day');
    @Output() valueChange = new EventEmitter();

    now = undefined;
    focus = undefined;

    hour: number = undefined;
    hour$ = new Subject<number>();

    minute: number = undefined;
    minute$ = new Subject<number>();

    periodIndex = 0;

    ngOnInit() {
        this.now = moment().startOf('day');
        this.focus = this.now.clone()
        this.value = moment(this.value);

        this.hour = this.value.hour();
        this.minute = this.value.minute();

        this.hour$
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(hour => this.selectHour(hour));

        this.minute$
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(minute => this.selectMinute(minute));

        setTimeout(() => {
            this.valueChange.emit(this.value);
        }, 0);
    }

    clear(): void {
        this.value = undefined;
        this.periodIndex = 0;
        this.value = moment();
        this.hour = undefined;
        this.minute = undefined;
    }

    setTarget(day): void {
        this.value = day;
        this.valueChange.emit(this.value);
    }

    nextMonth(): void {
        this.focus.add(1, 'month');
    }

    previousMonth(): void {
        this.focus.subtract(1, 'month');
    }

    nextYear(): void {
        this.focus.add(1, 'year');
    }

    previousYear(): void {
        this.focus.subtract(1, 'year');
    }

    invalidHour(): boolean {
        return this.hour < 0 || this.hour > 23
    }

    selectHour(hour): void {
        if (hour >= 0 && hour <= 23) {
            this.value.hour(hour);
            this.value.second(0);
            this.valueChange.emit(this.value);
        } else {
            this.hour$.next(undefined);
            this.hour = undefined;
        }
    }

    invalidMinute(): boolean {
        return this.minute < 0 || this.minute > 59
    }

    selectMinute(minute): void {
        if (minute >= 0 && minute <= 59) {
            this.value.minute(minute);
            this.value.second(0);
            this.valueChange.emit(this.value);
        } else {
            this.minute$.next(undefined);
            this.minute = undefined;
        }
    }

    getRange(): any {
        let startOfMonth = this.focus.clone().startOf('month');
        let endOfMonth = this.focus.clone().endOf('month');

        let startDay = startOfMonth.day();
        startOfMonth.subtract(startDay, 'days');

        return moment.range(startOfMonth, endOfMonth);
    }

    calendar(): {}[] {
        let range = this.getRange();
        return Array.from(range.by('day'));
    }
}
