declare module 'react-calendar' {
  import { ComponentType } from 'react';

  export interface CalendarProps {
    onChange?: (date: Date) => void;
    value?: Date;
    tileClassName?: (props: { date: Date; view: string }) => string | null;
    tileContent?: (props: { date: Date; view: string }) => JSX.Element | null;
    prevLabel?: JSX.Element;
    nextLabel?: JSX.Element;
    className?: string;
  }

  const Calendar: ComponentType<CalendarProps>;
  export default Calendar;
}
